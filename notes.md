- For running locally on wsl/docker/linux setup

comment the ports for Ollama container example below: 

Because for some reasons WSL reserve the port 11434 
```
# Defining Ollama container
  ollama:
    image: ollama/ollama:latest
    container_name: wanderlust-ollama
    restart: unless-stopped
      #    ports:
      # - "11434:11434"
```

- For .env Use dummy mentioned in the README.md or copy below mentioned dummy

CLOUD_NAME=REMOVEMEdummycloudREMOVEME
CLOUD_API_KEY=REMOVEME123456789012345REMOVEME
CLOUD_API_SECRET=REMOVEMEabcdefghijklmnopqrstuvwxyzABCDREMOVEME
MAP_TOKEN=REMOVEMEpk.eyJ1IjoiZHVtbXkiLCJhIjoiY2xkdW1teWR1bW15ZHVtbXlkdW15ZHVtbXkifQ.dummy_signature_here_1234567REMOVEME
SECRET=REMOVEMEwanderlust_local_secret_2024REMOVEME
ATLASDB_URL=mongodb://mongo:27017/wanderlust
OLLAMA_URL=http://ollama:11434
