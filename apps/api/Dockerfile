FROM python:3.10

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock .
RUN uv sync --frozen

RUN uv add gunicorn

COPY . .

RUN uv run manage.py collectstatic --noinput || true

ENV PATH="/venv/bin:$PATH"

EXPOSE 8000

CMD sh -c "uv run manage.py migrate && uv run gunicorn core.wsgi:application --bind 0.0.0.0:8000"