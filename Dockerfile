FROM ubuntu:20.04
RUN apt-get update && apt-get install -y sudo
RUN DEBIAN_FRONTEND=noninteractive  apt-get upgrade -y sudo 
RUN adduser --disabled-password \
--gecos '' docker-deployer
RUN adduser docker-deployer sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> \
/etc/sudoers

USER docker-deployer
RUN DEBIAN_FRONTEND=noninteractive sudo apt-get install -y tzdata && \
    sudo apt-get install -y curl apt-transport-https ca-certificates build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && \
    sudo apt-get install -y nodejs && \
    sudo apt-get update -y && sudo apt upgrade -y 

RUN RUN sudo apt-get update --fix-missing && \
    sudo apt-get install fontconfig -y && \
    sudo apt-get install nginx -y && \
    sudo apt-get install -y dirmngr gnupg && \
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7 && \
    sudo apt-get install -y apt-transport-https ca-certificates && \
    sudo sh -c 'echo deb https://oss-binaries.phusionpassenger.com/apt/passenger focal main > /etc/apt/sources.list.d/passenger.list' && \
    sudo apt-get update && \
    sudo apt-get install -y libnginx-mod-http-passenger && \
    if [ ! -f /etc/nginx/modules-enabled/50-mod-http-passenger.conf ]; then sudo ln -s /usr/share/nginx/modules-available/mod-http-passenger.load /etc/nginx/modules-enabled/50-mod-http-passenger.conf ; fi && \
    ls /etc/nginx/conf.d/mod-http-passenger.conf
    

WORKDIR /home/docker-deployer/
COPY training-ms.conf /etc/nginx/sites-available/
COPY .profile /home/docker-deployer/
RUN sudo ln -s /etc/nginx/sites-available/training-ms.conf /etc/nginx/sites-enabled
RUN sudo rm -rf /etc/nginx/sites-available/default
RUN sudo rm -rf /etc/nginx/sites-enabled/default
COPY mod-http-passenger.conf /etc/nginx/conf.d/mod-http-passenger.conf
RUN sudo service nginx restart

WORKDIR /home/docker-deployer/
COPY --chown=docker-deployer:docker-deployer ./package.json ./
COPY --chown=docker-deployer:docker-deployer . .

EXPOSE 7063

RUN sudo npm install --location=global npm@latest
RUN npm i --include=dev
#RUN npm run build
RUN mkdir logs 

RUN sudo service nginx restart
#RUN sudo chmod -R  755 build/
#RUN sudo chown -R docker-deployer:docker-deployer build/
