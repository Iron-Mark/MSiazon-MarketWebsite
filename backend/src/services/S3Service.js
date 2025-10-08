const { S3Client, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs");
const path = require("path");

class S3Service {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            }
        });
    }

    async uploadStaticFilesToS3() {
        return new Promise((resolve, reject) => {
            if (!process.env.S3_BUCKET) {
                console.log("S3_BUCKET not set; skipping static file upload.");
                return resolve();
            }

            if (!process.env.S3_REGION) {
                console.log("S3_REGION not set; skipping static file upload.");
                return resolve();
            }

            const staticFolder = path.join(__dirname, "../../../shared/static");
            if (!fs.existsSync(staticFolder)) {
                console.log("Static folder does not exist; skipping S3 upload.");
                return resolve();
            }

            fs.readdir(staticFolder, (err, files) => {
                if (err) {
                    console.error("Error reading static folder:", err);
                    return reject(err);
                }
                const forceReupload = (process.env.S3_FORCE_REUPLOAD || 'false').toLowerCase() === 'true';
                const skipIfExists = (process.env.S3_SKIP_EXISTING || 'true').toLowerCase() !== 'false';
                let uploaded = 0;
                let skipped = 0;
                let failed = 0;

                const uploadPromises = files.map(async (file) => {
                    const key = file;
                    const filePath = path.join(staticFolder, file);

                    // Optionally check if object already exists
                    if (!forceReupload && skipIfExists) {
                        try {
                            await this.s3Client.send(new HeadObjectCommand({
                                Bucket: process.env.S3_BUCKET,
                                Key: key
                            }));
                            // Exists -> skip
                            skipped++;
                            console.log(`⏭️  Skipping existing S3 object: ${key}`);
                            return;
                        } catch (headErr) {
                            // If 404 / NotFound, proceed to upload; for any other error log and still attempt
                            if (headErr.$metadata && headErr.$metadata.httpStatusCode === 404) {
                                // proceed to upload
                            } else if (headErr.name === 'NotFound') {
                                // proceed
                            } else {
                                console.warn(`HeadObject error for ${key} (will attempt upload anyway):`, headErr.message);
                            }
                        }
                    }

                    try {
                        const fileStream = fs.createReadStream(filePath);
                        const uploadParams = {
                            Bucket: process.env.S3_BUCKET,
                            Key: key,
                            Body: fileStream,
                        };
                        const parallelUpload = new Upload({
                            client: this.s3Client,
                            params: uploadParams
                        });
                        const data = await parallelUpload.done();
                        uploaded++;
                        console.log(`✅ Uploaded ${key} to ${data.Location}`);
                    } catch (err) {
                        failed++;
                        console.error(`❌ Error uploading ${key}:`, err.message);
                    }
                });

                Promise.all(uploadPromises)
                    .then(() => {
                        console.log(`S3 static sync summary: uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
                        resolve();
                    })
                    .catch(reject);
            });
        });
    }

    getImageUrl(imageName) {
        return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${imageName}`;
    }
}

module.exports = S3Service;