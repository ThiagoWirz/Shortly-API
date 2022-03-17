import { v4 as uuid } from "uuid";
import { connection } from "../database.js";

export async function postUrl(req, res) {
  const { url } = req.body;
  const authorization = req.headers.authorization;
  const token = authorization?.replace("Bearer ", "");
  try {
    const users = await connection.query(
      'SELECT "userId" FROM sessions WHERE token = $1',
      [token]
    );

    if (users.rowCount === 0) {
      return res.sendStatus(404);
    }
    const { userId } = users.rows[0];
    const shortUrl = uuid().split("-")[0];
    await connection.query(
      'INSERT INTO shorturls ("shortUrl", url, "userId") VALUES ($1, $2, $3)',
      [shortUrl, url, userId]
    );
    return res.status(201).send(shortUrl);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function getShortUrl(req, res) {
  const { shortUrl } = req.params;

  try {
    const result = await connection.query(
      'SELECT s.id, s."shortUrl", s.url FROM shortUrls s WHERE "shortUrl"= $1',
      [shortUrl]
    );

    if (result.rowCount === 0) {
      return res.sendStatus(404);
    }
    const { rows } = await connection.query(
      'SELECT "visitCount" FROM shortUrls WHERE "shortUrl"= $1',
      [shortUrl]
    );

    const count = rows[0].visitCount++;

    await connection.query(
      'UPDATE shorturls set "visitCount"=$1 WHERE "shortUrl" = $2',
      [count, shortUrl]
    );

    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function deleteUrl(req, res) {
  const { id } = req.params;
  const authorization = req.headers.authorization;
  const token = authorization?.replace("Bearer ", "");

  try {
    const users = await connection.query(
      'SELECT "userId" FROM sessions WHERE token = $1',
      [token]
    );
    const { userId } = users.rows[0];
    const url = await connection.query(
      'SELECT id FROM shortUrls WHERE id=$1 AND "userId"=$2',
      [id, userId]
    );
    if (url.rowCount === 0) {
      return res.sendStatus(401);
    }

    await connection.query("DELETE FROM shortUrls WHERE id=$1", [id]);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
