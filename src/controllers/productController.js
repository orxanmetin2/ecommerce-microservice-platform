const Product = require('../models/product');
const { createClient } = require('redis');

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

const CACHE_KEY = 'products:all';
const CACHE_TTL = 300;

exports.getAll = async (req, res, next) => {
  try {
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      console.log('Cache HIT');
      return res.json({ source: 'cache', data: JSON.parse(cached) });
    }
    console.log('Cache MISS');
    const products = await Product.findAll();
    await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(products));
    res.json({ source: 'db', data: products });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await redisClient.del(CACHE_KEY);
    res.status(201).json(product);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await redisClient.del(CACHE_KEY);
    res.json(product);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const product = await Product.remove(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await redisClient.del(CACHE_KEY);
    res.json({ message: 'Deleted', product });
  } catch (err) { next(err); }
};
