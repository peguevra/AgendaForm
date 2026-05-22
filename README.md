# AgendaForm（議題登録・月次通知システム）

## ■ 概要

本システムは、Webフォームから登録された議題をSupabaseに蓄積し、
月次で自動集計してメール通知する業務支援システムです。

メール送信はResend APIを利用し、Gmailフィルタを介して施設ごとに振り分けます。

---

## ■ システム構成

```text
Web UI（HTML/JS）
    ↓
Supabase（データベース）
    ↓
GitHub Actions（定期実行）
    ↓
Supabase Edge Function
    ↓
Resend API
    ↓
Gmail（フィルタ）
    ↓
施設メール（転送）