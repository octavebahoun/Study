FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN for i in 1 2 3 4 5; do \
    pip install --no-cache-dir --default-timeout=1000 -r requirements.txt && break || \
    (echo "Retrying pip install ($i)..." && sleep 10); \
    done
COPY . .
EXPOSE 5001
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "--timeout", "120", "app:app"]
