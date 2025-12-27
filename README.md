# Patchwork Worker

Deploying changes to DB:
```bash
npx wrangler d1 migrations create patchwork <comment like create_users_table>
```

```bash
npx wrangler d1 migrations apply --remote patchwork
```

```bash
npx wrangler d1 execute patchwork --remote --command "DELETE FROM d1_migrations WHERE name = 'migration_file.sql';"
```

```bash
curl -i -X GET "https://patchwork-api.extensible.dev/v1/models" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJvbWthYXJAZ21haWwuY29tIiwidGllciI6ImZyZWUiLCJpYXQiOjE3NjY4NzM2NDMsImV4cCI6MTc2OTQ2NTY0M30.1pBPc8tdRVjm9D8CVaal7etl4VM-8mwhc50H1wsd4oo"
```

Deploy:
```bash
npx wrangler deploy
```
