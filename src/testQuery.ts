import 'dotenv/config';
import { usersTable, type InsertUser } from './db/schema.ts';
import db from './db/db.ts';

async function main() {
  const user: InsertUser = {
    name: 'John',
    clerkId: 'user_randomassuser123',
    email: 'john@example.com',
    isNative: false,
  };

  await db.insert(usersTable).values(user);
  console.log('New user created!');

  const users = await db.select().from(usersTable);
  console.log('Getting all users from the database: ', users);
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

  // await db
  //   .update(usersTable)
  //   .set({
  //     age: 31,
  //   })
  //   .where(eq(usersTable.email, user.email));
  // console.log('User info updated!');
  //
  // await db.delete(usersTable).where(eq(usersTable.email, user.email));
  // console.log('User deleted!');
}

main();
