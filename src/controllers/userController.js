import bcrypt from "bcrypt";
import { connection } from "../database.js";

export async function createUser(req, res) {
  const user = req.body;

  try {
    const existingUsers = await connection.query(
      "SELECT * FROM users WHERE email=$1",
      [user.email]
    );
    if (existingUsers.rowCount > 0) {
      return res.sendStatus(409);
    }

    const passwordHash = bcrypt.hashSync(user.password, 10);

    await connection.query(
      `
      INSERT INTO 
        users(name, email, password) 
      VALUES ($1, $2, $3)
    `,
      [user.name, user.email, passwordHash]
    );

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getUser(req, res) {
  const { user } = res.locals;

  try {
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getUserInfo(req, res) {
  const { id } = req.params;

  try {
    const { rows: user } = await connection.query(
      `
    SELECT 
      u.id,
      u.name,
      s.id AS "shortUrlId",
      s."shortUrl",
      s.url,
      s."visitCount"
    FROM
      users u
    JOIN shortUrls s ON s."userId"=u.id
    WHERE u.id=$1`,
      [id]
    );

    if (user.length === 0) {
      return res.sendStatus(404);
    }

    const response = {
      id: user[0].id,
      name: user[0].name,
      visitCount: 0,
      shortenedUrls: [],
    };
    const shortenedUrls = user.map((el) => {
      response.visitCount += el.visitCount;
      return {
        id: el.shortUrlId,
        shortUrl: el.shortUrl,
        url: el.url,
        visitCount: el.visitCount,
      };
    });

    response.shortenedUrls = shortenedUrls;
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
