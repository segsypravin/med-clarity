/**
 * Utility to map AI medical findings/predictions to specific doctor specialties.
 * This ensures consistency across Scan Upload and Historical dashboards.
 */

export const getRecommendedDoctor = (prediction, confidence) => {
    let riskLevel = "Low";
    let riskClass = "success"; // used as 'success', 'warning', 'error' for CSS variables
    let doctor = "General Physician";

    const predLower = prediction?.toLowerCase() || "";
    
    // 1. Pulmonary / Chest Issues -> Pulmonologist
    const pulmonologistKeywords = [
        "pneumonia", "bacteria", "viral", "covid", "coronavirus", "effusion", 
        "atelectasis", "infiltration", "emphysema", "pneumothorax", "consolidation", 
        "edema", "fibrosis", "pleural", "tb", "tuberculosis", "lung", "chest", 
        "asthma", "bronchitis", "opacity"
    ];

    // 2. Tumors / Cancer -> Oncologist
    const oncologistKeywords = [
        "tumor", "cancer", "nodule", "mass", "malignant", "carcinoma", 
        "melanoma", "cyst", "neoplasm", "adenoma", "sarcoma"
    ];

    // 3. Heart / Vascular -> Cardiologist
    const cardiologistKeywords = [
        "cardiomegaly", "heart", "cardio", "vascular", "aorta", "arrhythmia", 
        "ischemia", "valve", "cardiac", "atrial", "hypertrophy", "artery"
    ];

    // 4. Diabetes / Hormones -> Endocrinologist
    const endocrinologistKeywords = [
        "diabetes", "thyroid", "pancreas", "sugar", "insulin", "hormone", 
        "pituitary", "adrenal", "metabolic", "goiter"
    ];

    // 5. Digestive / Liver -> Gastroenterologist
    const gastroKeywords = [
        "stomach", "liver", "ulcer", "gallbladder", "bowel", "colon", 
        "gastric", "intestinal", "digestive", "appendix", "cirrhosis"
    ];

    // 6. Healthy / Normal -> General Physician
    const normalKeywords = ["normal", "healthy", "none", "clear", "unremarkable"];

    // Check matches
    if (oncologistKeywords.some(w => predLower.includes(w))) {
        riskLevel = "High";
        riskClass = "error";
        doctor = "Oncologist";
    } else if (cardiologistKeywords.some(w => predLower.includes(w))) {
        riskLevel = "High";
        riskClass = "error";
        doctor = "Cardiologist";
    } else if (pulmonologistKeywords.some(w => predLower.includes(w))) {
        riskLevel = "High";
        riskClass = "error";
        doctor = "Pulmonologist";
    } else if (endocrinologistKeywords.some(w => predLower.includes(w))) {
        riskLevel = confidence > 0.6 ? "High" : "Medium";
        riskClass = confidence > 0.6 ? "error" : "warning";
        doctor = "Endocrinologist";
    } else if (gastroKeywords.some(w => predLower.includes(w))) {
        riskLevel = confidence > 0.5 ? "High" : "Medium";
        riskClass = confidence > 0.5 ? "error" : "warning";
        doctor = "Gastroenterologist";
    } else if (normalKeywords.some(w => predLower.includes(w))) {
        riskLevel = "Low";
        riskClass = "success";
        doctor = "General Physician";
    } else {
        // Fallback for unknown conditions based on confidence
        if (confidence >= 0.7) {
            riskLevel = "High";
            riskClass = "error";
        } else if (confidence >= 0.4) {
            riskLevel = "Medium";
            riskClass = "warning";
        } else {
            riskLevel = "Low";
            riskClass = "success";
        }
        doctor = "General Physician";
    }

    return { riskLevel, riskClass, doctor };
};
