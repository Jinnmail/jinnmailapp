export default function cred() {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'dev') {
        return {
            port: process.env.PORT,
            db: {
                mongodb: {
                    url: process.env.DB_HOST,
                    username: process.env.DB_USER,
                    password: process.env.DB_PASSWORD
                }
            },
            secret: process.env.JWT_SECRET,
            siteUrl: process.env.SITE_URL

        }
    } else if (process.env.NODE_ENV === 'prod') {
        return {
            port: process.env.PORT,
            db: {
                mongodb: {
                    url: process.env.DB_HOST,
                    username: process.env.DB_USER,
                    password: process.env.DB_PASSWORD
                }
            },
            secret: process.env.JWT_SECRET,
            siteUrl: process.env.SITE_URL
        }
    }
}