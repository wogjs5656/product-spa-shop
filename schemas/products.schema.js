// schemas/todo.schema.js

import mongoose from 'mongoose';

const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  password: {
    type: String,                       // 비밀번호 String으로 처리.
    required: true,
  },
  status: {
    type: String,
    enum: ["FOR_SALE","SOLD_OUT"],      // enum 추가로 두 가지 값만 가질 수 있게 추가
    default: "FOR_SALE",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// // 프론트엔드 서빙을 위한 코드입니다. 모르셔도 괜찮아요!
// productsSchema.virtual('productsId').get(function () {
//   return this._id.toHexString();
// });
// productsSchema.set('toJSON', {
//   virtuals: true,
// });

// productsSchema를 바탕으로 Todo모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model('product', productsSchema);
