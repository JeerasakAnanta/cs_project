echo "---------------- Start PDF  Managements API    ---------------------"
uvicorn pdf_management_api:app --host 0.0.0.0 --port 8004 --reload
echo "--------------------------------------------------------------------"
