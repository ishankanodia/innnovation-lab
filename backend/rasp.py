import paramiko
import io
from PIL import Image

def take_photo_and_return_image():
    # Raspberry Pi connection details
    hostname = "192.168.146.56"
    username = "ishankanodia"
    password = "ishan"
    remote_image_path = "img.png"

    # Initialize SSH and SFTP clients
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        # Connect to Raspberry Pi
        ssh.connect(hostname, username=username, password=password)

        # Execute the raspistill command to take a photo
        ssh.exec_command(f"raspistill -o {remote_image_path}")

        # Wait briefly for the command to finish
        ssh.exec_command("sleep 2")

        # Initialize SFTP for file transfer
        sftp = ssh.open_sftp()

        # Download the image from Raspberry Pi to local memory
        with sftp.file(remote_image_path, 'rb') as remote_file:
            image_data = remote_file.read()
            image = Image.open(io.BytesIO(image_data))

        # Clean up the remote image if needed
        ssh.exec_command(f"rm {remote_image_path}")

        # Save the image locally if needed
        local_image_path = 'uploads/img.png'  # Define where to save the image
        image.save(local_image_path)

        return local_image_path  # Return the local image path

    except Exception as e:
        print("Failed to take or transfer the photo:", e)
        return None
    
    finally:
        # Close the SSH and SFTP connections
        if 'sftp' in locals():
            sftp.close()
        ssh.close()

if __name__ == "__main__":
    print(take_photo_and_return_image())
