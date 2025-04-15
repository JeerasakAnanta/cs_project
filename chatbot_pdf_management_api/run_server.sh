echo "---------------- Start PDF  Managements API    ---------------------"
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
echo "--------------------------------------------------------------------"