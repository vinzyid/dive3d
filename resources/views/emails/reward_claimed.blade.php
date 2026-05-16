<!DOCTYPE html>
<html>
<head>
    <title>Klaim Hadiah Dive3D</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .content { margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #777; text-align: center; }
        .highlight { color: #007bff; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Klaim Hadiah Berhasil!</h2>
        </div>
        <div class="content">
            <p>Halo,</p>
            <p>Terima kasih telah berpartisipasi dalam program <strong>Dive3D</strong>!</p>
            <p>Anda telah berhasil mengklaim hadiah: <span class="highlight">{{ $rewardName }}</span>.</p>
            <p style="background: #fff3cd; padding: 15px; border-left: 5px solid #ffc107;">
                <strong>Pemberitahuan:</strong><br>
                Mohon maaf, fitur ini masih dalam tahap pengembangan. Hadiah Anda telah tercatat di sistem kami, namun proses pengiriman fisik/digital akan dilakukan setelah sistem rilis sepenuhnya. Tunggu informasi lebih lanjut melalui email ini.
            </p>
            <p>Teruslah belajar dan menjelajahi keindahan laut bersama Dive3D!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Dive3D - Conservation & Exploration. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
