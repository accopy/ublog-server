/**
 * Category model module.
 * @file 分类数据模型
 * @module model/category
 */

const mongoose = require('./db.js');

// 分类集合模型
const categorySchema = new mongoose.Schema({
  // 分类名称
  name: { type: String, required: true, validate: /\S+/ },
  //创建者id
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },

  // 创建日期
  create_time: { type: Date, default: Date.now },

  // 最后修改日期
  update_time: { type: Date, default: Date.now },
});

// 分类模型
module.exports = mongoose.model('Category', categorySchema);
