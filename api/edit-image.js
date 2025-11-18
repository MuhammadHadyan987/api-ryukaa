const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/edit-image', async (req, res) => {
    const { imageBase64, prompt } = req.body;

    if (!imageBase64 || !prompt) {
        return res.status(400).json({ error: "imageBase64 dan prompt wajib diisi" });
    }

    try {
        const job = await axios.post("https://stablehorde.net/api/v2/generate/async", {
            prompt,
            source_image: imageBase64,
            params: {
                denoising_strength: 0.7,
                cfg_scale: 8,
                steps: 30
            }
        });

        const jobId = job.data.id;

        // cek status setiap 2 detik
        let result = null;

        while (!result) {
            const check = await axios.get(`https://stablehorde.net/api/v2/generate/status/${jobId}`);
            if (check.data.done) {
                result = check.data;
                break;
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        const finalImage = result.generations[0].img;

        res.json({
            status: "success",
            image_base64: finalImage
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal edit gambar" });
    }
});

module.exports = router;
