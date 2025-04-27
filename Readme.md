#  Altruistiq Fullstack Support Engineer Assessment Submission (Daniyal Qureshi)

This application visualizes animated emissions data across 269 countries over time.

### Pull Request: https://github.com/Daniyal-Qureshi/aq-fullstack-support-assessment-daniyal/pull/1

### Post-Mortem Report : https://github.com/Daniyal-Qureshi/aq-fullstack-support-assessment-daniyal/blob/0b8c46b148e1c9f54f468d003dcda6277f029ad4/postmortem.md

## 🚀 Quick Start

```bash
# 1. Clone repo
git clone https://github.com/Daniyal-Qureshi/aq-fullstack-support-assessment-daniyal
cd aq-fullstack-support-assessment-daniyal

# 2. Install dependencies
cd api && npm install --legacy-peer-deps # pinia testing requires pinia >=3.0.2 
cd ../client && npm install

# 3. Set up environment variables (copy api/.env.example to api/.env)

# 4. Start Redis (requires Redis installed)
redis-server

# 5. Run both servers
cd api && npm run dev
cd ../client && npm run dev

#6. Run tests 
cd api && npm run test
cd ../client && npm run test
```
