# Usar una imagen base de Eclipse Temurin Java 23
FROM eclipse-temurin:23-jdk


# Crear el directorio /uploads y asignar permisos
#RUN mkdir -p /uploads
RUN mkdir -p /app/uploads
RUN chmod -R 777 /app/uploads


# Copiar el archivo JAR de la aplicación al contenedor
#ARG JAR_FILE=target/rifa-0.0.1-SNAOSHOT.jar
COPY target/rifa-0.0.1-SNAPSHOT.jar java-app.jar
#COPY ${JAR_FILE} java-app.jar

# Exponer el puerto 8080
EXPOSE 8080

# Configurar el comando de entrada para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "java-app.jar"]

