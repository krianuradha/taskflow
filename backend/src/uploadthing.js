// Minimal Uploadthing stub for Express.
// Replace the router definition below with your actual file route(s)
// once you add uploadthing as a dependency: npm i uploadthing
//
// Docs: https://docs.uploadthing.com/backend-adapters/express

let uploadRouter

try {
  const { createUploadthing } = await import('uploadthing/express')
  const f = createUploadthing()

  uploadRouter = {
    // Example route — add yours here
    imageUploader: f({ image: { maxFileSize: '4MB' } })
      .middleware(async ({ req }) => {
        // Auth check here if needed
        return {}
      })
      .onUploadComplete(async ({ metadata, file }) => {
        console.log('Upload complete:', file.url)
        return { url: file.url }
      }),
  }
} catch {
  // uploadthing not installed yet — export empty router so index.js doesn't crash
  uploadRouter = {}
}

export { uploadRouter }
