# 📊 Calculator Microservice with MongoDB (SIT737 - 9.1P)

This project is a cloud-native calculator microservice built with **Node.js**, **Express**, and **MongoDB**, deployed on **Kubernetes** with secure credential management, persistent storage, and database logging.

---

## 🚀 Features

- Four calculator operations: **add, subtract, multiply, divide**
- Logs every operation into a **MongoDB database**
- Deployed via **Kubernetes** with:
  - Secret-based credential injection
  - Persistent volume storage for MongoDB
  - Separate deployments for app and database
- Winston-based structured logging
- Supports disaster recovery via `mongodump`/`mongorestore`

---

## ⚙️ Technologies

- Node.js + Express
- MongoDB
- Docker
- Kubernetes
- Winston logger
- Secrets, PVC, ConfigMaps

---

## 📁 Project Structure

calculator/
│
├── app.js # Express server
├── Dockerfile # Container config
├── package.json # App dependencies
│
├── deployment.yaml # Calculator app deployment
├── service.yaml # Calculator app service (NodePort)
│
├── mongo-deployment.yaml # MongoDB deployment
├── mongo-pvc.yaml # PersistentVolumeClaim for MongoDB
├── mongo-secret.yaml # Base64-encoded Mongo credentials


---

## 🔧 API Endpoints

| Method | URL Example                              | Description         |
|--------|-------------------------------------------|---------------------|
| GET    | `/add?val1=5&val2=3`                     | Adds two numbers    |
| GET    | `/subtract?val1=5&val2=3`                | Subtracts numbers   |
| GET    | `/multiply?val1=5&val2=3`                | Multiplies numbers  |
| GET    | `/divide?val1=5&val2=3`                  | Divides numbers     |

Response:
```json
{
  "result": 8
}
Each operation is logged to MongoDB under the calculations collection.

🐳 Deployment Guide
1. Build & Push Docker Image
docker build -t mariyatheresa/calculator-microservice:latest .
docker push mariyatheresa/calculator-microservice:latest

2. Apply Kubernetes Resources
kubectl apply -f mongo-secret.yaml
kubectl apply -f mongo-pvc.yaml
kubectl apply -f mongo-deployment.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

3. Access the Service
Open in browser:
http://localhost:30100/add?val1=8&val2=2

CRUD Operations Test (in Mongo Shell)
kubectl exec -it mongo-6bdd5bf998-2mt22 -- mongosh -u mongouser -p password --authenticationDatabase admin

Create:
Handled automatically via the app.

Read:
use calculatorDB
db.calculations.find().pretty()

Update:
db.calculations.updateOne({ val1: 8 }, { $set: { result: 99 } })

Delete:
db.calculations.deleteOne({ val1: 8 })

Backups & Disaster Recovery
Backup:
mongodump --uri="mongodb://mongouser:password@mongo-service:27017/calculatorDB" --out=backup/

Restore:
mongorestore --uri="mongodb://mongouser:password@mongo-service:27017" backup/

Monitoring
App logs:
kubectl logs <calculator-pod-name>

MongoDB server health:
db.serverStatus()
