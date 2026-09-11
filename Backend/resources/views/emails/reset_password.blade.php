<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f4;
            color: #2b3b32;
        }
        .container {
            max-width: 580px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            border: 1px solid #e1ebe3;
        }
        .header {
            background: linear-gradient(135deg, #183a2b 0%, #0d2319 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            margin: 0;
            letter-spacing: 0.5px;
        }
        .header p {
            color: #a8d5b5;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 6px;
            margin-bottom: 0;
        }
        .content {
            padding: 36px 32px;
        }
        .content h2 {
            font-size: 18px;
            color: #183a2b;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .content p {
            font-size: 15px;
            line-height: 1.6;
            color: #4a5d52;
            margin-bottom: 24px;
        }
        .button-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        .btn-reset {
            display: inline-block;
            background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
            color: #ffffff !important;
            font-weight: 700;
            font-size: 15px;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 50px;
            box-shadow: 0 4px 14px rgba(46, 125, 50, 0.35);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .info-box {
            background-color: #f0f7f2;
            border-left: 4px solid #2e7d32;
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        .info-box p {
            margin: 0;
            font-size: 13px;
            color: #2b4c38;;
        }
        .footer {
            background-color: #f8faf8;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #ebf2ec;
        }
        .footer p {
            font-size: 12px;
            color: #83968a;
            margin: 4px 0;
        }
        .link-break {
            word-break: break-all;
            color: #2e7d32;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Minneriya Wild Jeep Safari</h1>
            <p>Password Reset Request</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->User_Name ?? 'Valued Customer' }},</h2>
            <p>We received a request to reset the password for your account associated with <strong>{{ $email }}</strong>.</p>
            
            <div class="button-wrapper">
                <a href="{{ $resetUrl }}" class="btn-reset" target="_blank">Reset Password</a>
            </div>

            <div class="info-box">
                <p><strong>Note:</strong> This password reset link is valid for <strong>{{ $expireMinutes }} minutes</strong>. If you did not request a password reset, no further action is required and your account remains secure.</p>
            </div>

            <p style="font-size: 13px; color: #6b7c72;">If the button above does not work, copy and paste the following link directly into your browser:</p>
            <p class="link-break"><a href="{{ $resetUrl }}" style="color: #2e7d32;">{{ $resetUrl }}</a></p>
        </div>

        <div class="footer">
            <p><strong>Minneriya Wild Jeep Safari</strong> — Sri Lanka</p>
            <p>&copy; {{ date('Y') }} Minneriya Wild Jeep Safari. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
