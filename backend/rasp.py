# rasp.py
import paramiko
import uuid
import time
import os

def take_photo_and_save_locally(local_directory):
    hostname = "192.168.216.56"
    username = "ishankanodia"
    password = "ishan"
    remote_image_path = "img.png"
    local_image_path = os.path.join(local_directory, f"{str(uuid.uuid4())}.png")

    if not os.path.exists(local_directory):
        return None

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(hostname, username=username, password=password, timeout=10)
        ssh.exec_command(f"raspistill -o {remote_image_path}")
        time.sleep(10)

        sftp = ssh.open_sftp()
        retries = 0
        while retries < 10:
            try:
                sftp.stat(remote_image_path)
                if sftp.stat(remote_image_path).st_size > 0:
                    break
            except FileNotFoundError:
                pass
            retries += 1
            time.sleep(1)

        if retries == 10:
            return None

        sftp.get(remote_image_path, local_image_path)
        sftp.close()
        time.sleep(2)

        if os.stat(local_image_path).st_size == 0 or not os.path.exists(local_image_path):
            return None

        return local_image_path

    except Exception as e:
        return None
    finally:
        ssh.close()

if __name__ == "__main__":
    local_directory = "/Users/ishankanodia/Desktop/att/innnovation-lab/backend/uploads"
    image_path = take_photo_and_save_locally(local_directory)
    
    if image_path:
        print(image_path)  # Only print the path here
    else:
        print("Error: Failed to capture the image.")
