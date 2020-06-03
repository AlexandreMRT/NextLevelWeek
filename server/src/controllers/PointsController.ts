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
      image: 'image-fake',
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
  
    const pointItems = items.map((item_id: number) => {

      return{
        item_id,
        point_id: points_id,
      };
    })
  
    await trx('point_items').insert(pointItems);
  
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

      return res.status(200).json({ point, items });
  }



}

export default PointsController;