import { Request, Response, response } from 'express';
import knex from '../database/connection';

class PointsController {
  async create(req: Request, res: Response)  {

    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = req.body

    const trx = await knex.transaction();

    const point = {
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }
  
    const insertedIds = await trx('points').insert(point);
  
    const points_id = insertedIds[0];
  
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {

      return{
        item_id,
        point_id: points_id,
      };
    })
  
    await trx('point_items').insert(pointItems);

    await trx.commit();
  
    return res.json({
      id: points_id,
      ...point,
    });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex('points').where('id', id).first();

    if(!point) {
      return res.status(400).json({ message: 'Point not found'});
    }
    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

      const serializePoint = {
          ...point,
          image_url: `http:192.168.0.250:3333/uploads/${point.image}`,
      };

      return res.status(200).json({ point: serializePoint, items });
  }

  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

      const serializePoints = points.map(point => {
        return {
          ...point,
          image_url: `http:192.168.0.250:3333/uploads/${point.image}`,
        }
      })

    return res.status(200).json(serializePoints)
  }
}

export default PointsController;