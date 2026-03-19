# Barcode backend

## Install Prisma

https://www.prisma.io/docs/prisma-orm/quickstart/mysql
To get the existing DB
```
npx prisma db pull
npx prisma generate
npx prisma migrate diff \\n  --from-empty \\n  --to-schema prisma/schema.prisma \\n  --script > prisma/migrations/0_init/migration.sql
npx prisma migrate resolve --applied 0_init\nnpx prisma migrate dev --name test --create-only
```

To create a new migration:
```
npx prisma migrate dev --name test --create-only
npx prisma migrate dev
```

## Install Express
https://expressjs.com/en/starter/hello-world.html

