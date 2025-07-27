#!/bin/bash
SHUT_DOWN=0

while [ $# -gt 0 ]; do
  case "$1" in
    --shutdown)
      SHUT_DOWN=1
      shift
      ;;
    *)
      echo "Unknown flag: $1"
      shift
      ;;
  esac
done

if [ "$SHUT_DOWN" -eq 1 ]; then
    echo "Deleting deployments"
    kubectl delete deployments frontend backend website
    echo "Deleting services"
    kubectl delete services frontend backend website
else
    kubectl apply -f k8s/env-configmap.yaml
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/backend-service.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/frontend-service.yaml
    kubectl apply -f k8s/website-deployment.yaml
    kubectl apply -f k8s/website-service.yaml
fi

# kubectl rollout restart deployment frontend