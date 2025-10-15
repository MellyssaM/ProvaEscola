const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!senha || !email) {
        return res.status(400).json({ message: "E-mail e senha são obrigatórios" });
    }

    try {
        const usuario = await prisma.usuario.findFirst({
            where: { 
                email,
                senha: parseInt(senha)
            },
            select: {
                id: true,
                email: true,
            }
        });

        if (!usuario) {
            return res.status(401).json({ message: "E-mail ou senha incorretos" });
        }

        res.status(200).json({
            ...usuario,
            message: "Login bem-sucedido"
        });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

module.exports = { login };