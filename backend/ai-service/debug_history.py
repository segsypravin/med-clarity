import requests

# This script helps debug কেন parameter matching fail হচ্ছে
# It fetches the history and prints the test names for the last two reports

BASE_URL = "http://localhost:5000/api/history"

def debug_history():
    try:
        response = requests.get(BASE_URL)
        if response.status_code != 200:
            print(f"Error: Status code {response.status_code}")
            return
        
        data = response.json()
        if not data.get('success'):
            print("Error: API returned success=false")
            return
        
        records = data.get('records', [])
        if len(records) < 2:
            print(f"Not enough records to compare. Found {len(records)}.")
            return
        
        print(f"Found {len(records)} records. Checking the most recent two.\n")
        
        for i, record in enumerate(records[:2]):
            print(f"--- Report {i+1} ({record.get('date')}) ---")
            print(f"Type: {record.get('type')}")
            
            res = record.get('result', {})
            tests = res.get('tests') or res.get('ai_analysis') or []
            
            print(f"Test Count: {len(tests)}")
            for t in tests:
                name = t.get('test') or t.get('name')
                value = t.get('value')
                print(f"  - {name}: {value}")
            print("\n")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    debug_history()
