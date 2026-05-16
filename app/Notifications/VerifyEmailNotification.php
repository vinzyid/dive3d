<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verifikasi Alamat Email Anda - DIVEXPLORE')
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('Terima kasih telah mendaftar di **DIVEXPLORE**.')
            ->line('Klik tombol di bawah untuk memverifikasi alamat email Anda dan mulai menjelajahi dunia bawah laut.')
            ->action('Verifikasi Email Sekarang', $verificationUrl)
            ->line('Link ini akan kedaluwarsa dalam **60 menit**.')
            ->line('Jika Anda tidak membuat akun di DIVEXPLORE, abaikan email ini.')
            ->salutation('Salam, Tim DIVEXPLORE');
    }

    protected function verificationUrl($notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
}
