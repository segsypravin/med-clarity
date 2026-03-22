def sort_and_cluster(ocr_results, y_tolerance=10):
    """
    Takes raw EasyOCR output and clusters it into rows (lines of text).
    ocr_results format: [ (bbox, text, confidence), ... ]
    bbox format: [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
    """
    if not ocr_results:
        return []

    # Calculate center y and min x for each box to sort them
    boxes = []
    for bbox, text, conf in ocr_results:
        # bbox is usually 4 points: top-left, top-right, bottom-right, bottom-left
        tl = bbox[0]
        # bl = bbox[3]
        min_x = tl[0]
        center_y = (bbox[0][1] + bbox[3][1]) / 2.0
        # Average height
        h = bbox[3][1] - bbox[0][1]
        
        boxes.append({
            'min_x': min_x,
            'center_y': center_y,
            'height': h,
            'text': text,
            'conf': conf
        })

    # Sort primarily by center_y
    boxes.sort(key=lambda b: b['center_y'])

    # Group into lines
    lines = []
    current_line = [boxes[0]]
    
    for box in boxes[1:]:
        prev_box = current_line[-1]
        
        # If the Y difference is within tolerance, it's on the same line
        # Use a fraction of height as tolerance, or a pixel value
        dynamic_tolerance = max(y_tolerance, prev_box['height'] * 0.4)
        
        if abs(box['center_y'] - prev_box['center_y']) <= dynamic_tolerance:
            current_line.append(box)
        else:
            # Sort current line by X
            current_line.sort(key=lambda b: b['min_x'])
            lines.append(current_line)
            current_line = [box]
            
    if current_line:
        current_line.sort(key=lambda b: b['min_x'])
        lines.append(current_line)

    # Reconstruct text line by line
    reconstructed_text_lines = []
    for line in lines:
        line_text = " ".join([b['text'] for b in line])
        reconstructed_text_lines.append(line_text)
        
    return reconstructed_text_lines
