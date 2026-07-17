ARG JEECG_VERSION=3.7.4
FROM registry.cn-hangzhou.aliyuncs.com/dockerhub_mirror/java:21-anolis

MAINTAINER jeecgos@163.com

ARG JEECG_VERSION
ENV JEECG_VERSION=${JEECG_VERSION}

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

RUN mkdir -p /jeecg-dcs-cloud

WORKDIR /jeecg-dcs-cloud

EXPOSE 7008

ADD ./target/jeecg-dcs-cloud-start-${JEECG_VERSION}.jar ./

CMD sleep 60;java -Dfile.encoding=utf-8 -Djava.security.egd=file:/dev/./urandom -jar jeecg-dcs-cloud-start-${JEECG_VERSION}.jar
