FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN useradd --create-home --uid 10001 appuser

COPY requirements-runtime.txt ./
RUN python -m pip install --no-cache-dir -r requirements-runtime.txt

COPY app ./app
COPY run.py ./run.py

RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["python", "run.py"]
