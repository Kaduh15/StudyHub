FROM python:3.10

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock .

RUN uv sync

ENV PATH="/venv/bin:$PATH"

COPY . .

EXPOSE 8000

CMD ["uv", "run", "manage.py", "runserver", "0.0.0.0:8000"]