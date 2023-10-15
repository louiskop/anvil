import React, { useState, useRef } from "react";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function generateFileName(filename, length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomText = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomText += characters.charAt(randomIndex);
    }

    let filenameParts = filename.split('.')
    return filenameParts[0] + randomText + '.' + filenameParts[1];
}

function S3Bucket({ setNewAvatarLink }) {
    const fileInputRef = useRef(null);
    const allowedImageTypes = ["image/jpeg", "image/png"];
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (file) => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        if (!allowedImageTypes.includes(file.type)) {
            console.log(file.type);
            alert("Please select a valid image type.");
            return;
        }

        const S3_BUCKET = "anvil-photos";
        const REGION = "eu-west-1";

        const s3Client = new S3Client({
            region: REGION,
            credentials: {
                accessKeyId: "AKIAYNAX2JHFFUKBVYTH",
                secretAccessKey: "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",
            },
        });

        const params = {
            Bucket: S3_BUCKET,
            Key: generateFileName(file.name, 16),
            Body: file,
        };

        try {
            setUploading(true);
            const response = await s3Client.send(new PutObjectCommand(params));

            const S3link = "https://anvil-photos.s3.eu-west-1.amazonaws.com/" + params.Key;
            setNewAvatarLink(S3link);

            console.log("S3 Upload Response:", response);
            alert("File uploaded successfully.");
        } catch (error) {
            console.error("Error uploading file to S3:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        uploadFile(selectedFile);
    };

    const handleButtonClick = () => {
        // Trigger the file input click event
        fileInputRef.current.click();
    };

    return (
        <div>
            {uploading ? (
                <span className="loading loading-spinner text-primary w-8 mx-6"></span>
            ) : (
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                    <button className='btn btn-outline btn-primary' onClick={handleButtonClick}>
                        Upload
                    </button>
                </div>
            )}
        </div>
    );
}

export default S3Bucket;
