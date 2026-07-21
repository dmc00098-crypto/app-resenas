import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializamos el cliente de Groq con la clave del .env
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Ruta que recibe la reseña y llama a la IA de Groq
app.post('/api/responder', async (req, res) => {
    try {
        const { resena, tono } = req.body;

        if (!resena) {
            return res.status(400).json({ error: 'Falta la reseña' });
        }

        const promptSistema = `
Eres un experto en gestión de reputación online para hostelería y comercios.
Tu objetivo es redactar la respuesta perfecta a la reseña del usuario.

Pautas:
1. Detecta la intención y el sentimiento de la reseña.
2. Sé empático, agradecido o firme según el caso.
3. Tono requerido: ${tono}.
4. Longitud: Entre 40 y 80 palabras.
5. Devuelve ÚNICAMENTE el texto de la respuesta final, sin introducciones ni comillas.
        `;

        // Usamos el modelo Llama 3 de Meta alojado en Groq (Gratis y ultra rápido)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: promptSistema },
                { role: "user", content: `Reseña a contestar: "${resena}"` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const respuestaIA = chatCompletion.choices[0]?.message?.content || "";
        res.json({ respuesta: respuestaIA });

    } catch (error) {
        console.error("Error al conectar con Groq:", error);
        res.status(500).json({ error: 'Hubo un error al generar la respuesta.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});