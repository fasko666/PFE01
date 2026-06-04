<?php

namespace App\Services;

/**
 * Pure-PHP RFC 6238 TOTP implementation. Avoids pulling in google2fa/fortify;
 * compatible with Google Authenticator, Authy, 1Password, Microsoft Authenticator.
 *
 * Secret: base32-encoded (RFC 4648). Authenticator apps require base32, not hex.
 */
class TotpService
{
    private const PERIOD = 30;
    private const DIGITS = 6;
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /** 160-bit secret (20 bytes), base32-encoded → 32 chars. */
    public function generateSecret(): string
    {
        return $this->base32Encode(random_bytes(20));
    }

    /** Build the otpauth:// URI for QR rendering. */
    public function otpauthUri(string $secret, string $accountEmail, string $issuer): string
    {
        $label = rawurlencode("{$issuer}:{$accountEmail}");
        $params = http_build_query([
            'secret'  => $secret,
            'issuer'  => $issuer,
            'algorithm' => 'SHA1',
            'digits'  => self::DIGITS,
            'period'  => self::PERIOD,
        ]);
        return "otpauth://totp/{$label}?{$params}";
    }

    /** Verify a user-supplied code, allowing ±$window 30-second steps for clock skew. */
    public function verify(string $secret, string $code, int $window = 1): bool
    {
        $code = preg_replace('/\s+/', '', $code);
        if (! ctype_digit($code) || strlen($code) !== self::DIGITS) return false;

        $time = time();
        for ($i = -$window; $i <= $window; $i++) {
            $expected = $this->compute($secret, intdiv($time, self::PERIOD) + $i);
            if (hash_equals($expected, $code)) return true;
        }
        return false;
    }

    /** Compute a single TOTP code at the given counter step. */
    private function compute(string $secret, int $counter): string
    {
        $secretBytes = $this->base32Decode($secret);
        if ($secretBytes === '') return '';

        // 8-byte big-endian counter
        $bin = pack('N*', 0, $counter);

        $hash = hash_hmac('sha1', $bin, $secretBytes, true);
        $offset = ord($hash[strlen($hash) - 1]) & 0x0F;

        $value = ((ord($hash[$offset])     & 0x7F) << 24)
               | ((ord($hash[$offset + 1]) & 0xFF) << 16)
               | ((ord($hash[$offset + 2]) & 0xFF) << 8)
               |  (ord($hash[$offset + 3]) & 0xFF);

        return str_pad((string) ($value % (10 ** self::DIGITS)), self::DIGITS, '0', STR_PAD_LEFT);
    }

    /** Generate 10 single-use 10-char recovery codes (alphanumeric, dashed). */
    public function generateRecoveryCodes(int $count = 10): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $bytes = strtoupper(bin2hex(random_bytes(5)));            // 10 hex chars
            $codes[] = substr($bytes, 0, 5) . '-' . substr($bytes, 5, 5);
        }
        return $codes;
    }

    public function base32Encode(string $bytes): string
    {
        if ($bytes === '') return '';
        $bits = '';
        foreach (str_split($bytes) as $b) {
            $bits .= str_pad(decbin(ord($b)), 8, '0', STR_PAD_LEFT);
        }
        $out = '';
        foreach (str_split($bits, 5) as $chunk) {
            $chunk = str_pad($chunk, 5, '0');
            $out .= self::ALPHABET[bindec($chunk)];
        }
        return $out;
    }

    public function base32Decode(string $s): string
    {
        $s = strtoupper(preg_replace('/[^A-Z2-7]/', '', $s));
        if ($s === '') return '';
        $bits = '';
        foreach (str_split($s) as $c) {
            $i = strpos(self::ALPHABET, $c);
            if ($i === false) continue;
            $bits .= str_pad(decbin($i), 5, '0', STR_PAD_LEFT);
        }
        $out = '';
        foreach (str_split($bits, 8) as $byte) {
            if (strlen($byte) === 8) $out .= chr(bindec($byte));
        }
        return $out;
    }
}
