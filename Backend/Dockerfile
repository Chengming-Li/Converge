FROM python:3.12

WORKDIR /app

COPY . .

RUN python -m venv venv
RUN . venv/bin/activate

RUN pip3 install -r requirements.txt

RUN curl --create-dirs -o $HOME/.postgresql/root.crt 'https://cockroachlabs.cloud/clusters/b2cb6dd2-cd8a-4a9a-a258-f9ff73385ceb/cert'

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]