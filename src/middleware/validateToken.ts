import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

const LOG_URL = process.env.LOG_URL || 'http://localhost:5000/log';

export const validateToken = async (req: Request, res: Response) => {
	const token =
		req.body.token ?? req.headers['auth-token'] ?? req.cookies.token;

	if (!token) {
		fetch(LOG_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				metodo: 'GET',
				servicio: 'auth/validate',
				peticion: 'frontend',
				respuesta: 'Acceso denegado',
			}),
		});
		return res.status(401).json({ message: 'Acceso denegado' });
	}

	try {
		const payload = jwt.verify(
			token,
			process.env.TOKEN_SECRET || 'token'
		) as jwt.JwtPayload;

		const user = await User.findById(payload._id).populate('contacts').exec();
		const { password, ...userToSend } = user!.toObject();

		fetch(LOG_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Allow-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({
				metodo: 'GET',
				servicio: 'auth/validate',
				peticion: 'frontend',
				respuesta: 'Token valido',
			}),
		})
			.then((res) => res.text())
			.then(console.log);
		res.json({
			message: 'Token valido',
			data: userToSend,
		});
	} catch (error) {
		res.status(400).json({ message: 'Token invalido' });
	}
};
