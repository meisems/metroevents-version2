import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:     process.env.DATABASE_HOST     || 'localhost',
  port:     +(process.env.DATABASE_PORT   || 5432),
  database: process.env.DATABASE_NAME     || 'metroevents',
  username: process.env.DATABASE_USER     || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  entities:   [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
