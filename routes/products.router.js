import express from 'express';
import Product from '../schemas/products.schema.js';

const router = express.Router();

/* 상품 등록 API */
//- 상품명, 작성 내용, 작성자명, 비밀번호를 **request**에서 전달 받기
//- 상품은 두 가지 상태, **판매 중(`FOR_SALE`)및 판매 완료(`SOLD_OUT`)** 를 가질 수 있습니다.
//- 상품 등록 시 기본 상태는 **판매 중(`FOR_SALE`)** 입니다.
router.post('/products', async (req, res, next) => {
  try {
    const { title, content, author, password } = req.body;

    if (!title || !content || !author || !password) {
      return res
        .status(400)
        .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }

    const status = 'FOR_SALE';

    const newProduct = new Product({ title, content, author, password, status });
    await newProduct.save();

    return res.status(201).json({ message: '상품을 등록하였습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '서버 에러 발생' });
  }
});

/** 상품 목록 조회 API */
//- 상품명, 작성자명, 상품 상태, 작성 날짜 조회하기
//- 상품 목록은 작성 날짜를 기준으로 **내림차순(최신순)** 정렬하기
router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find()
      .select('title author status createdAt')
      .sort('-createdAt');
    return res.status(200).json({ data: products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '서버 에러 발생' });
  }
});

/** 상품 상세 조회 API **/
//- 상품명, 작성 내용, 작성자명, 상품 상태, 작성 날짜 조회하기
router.get('/products/:productsId', async (req, res, next) => {
  try {
    const products = await Product.findOne({
      _id: req.params.productsId,
    }).select('_id title author content status createdAt');
    if (!products) {
      return res.status(404).json({ message: '상품 조회에 실패하였습니다.' });
    } else {
      return res.status(200).json({ data: products });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '서버 에러 발생.' });
  }
});

/** 상품 정보 변경 API **/
//- 상품명, 작성 내용, 상품 상태, 비밀번호를 **request**에서 전달받기
//- 수정할 상품과 비밀번호 일치 여부를 확인한 후, 동일할 때만 글이 **수정**되게 하기
//- 선택한 상품이 존재하지 않을 경우, “상품 조회에 실패하였습니다." 메시지 반환하기
router.put('/products/:productsId', async (req, res, next) => {
  try {
    const { title, content, password, status } = req.body;
    const productsId = req.params.productsId;

    if (!title || !content || !password || !status) {
      return res
        .status(400)
        .json({ message: '데이터 형식이 올바르지 않습니다.' });
    }

    // 상품 조회
    const currentProduct = await Product.findById(productsId);

    // 상품이 존재하지 않는 경우 에러 응답
    if (!currentProduct) {
      return res.status(404).json({ message: '상품 조회에 실패하였습니다.' });
    }

    // 비밀번호가 일치하는 경우에만 수정 진행
    if (currentProduct.password === Number(password)) {
      // 상태 및 내용은 항상 수정
      currentProduct.status = status;
      currentProduct.content = content;

      // 제목이 입력된 경우에만 수정
      if (title) {
        currentProduct.title = title;
      }

      // 상품 정보 저장
      await currentProduct.save();

      return res
        .status(200)
        .json({ message: '상품 정보가 성공적으로 수정되었습니다.' });
    } else {
      // 비밀번호 불일치 시 에러 응답
      return res
        .status(401)
        .json({ message: '상품을 수정할 권한이 없습니다.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '서버 에러 발생' });
  }
});

/** 상품 삭제 API */
//- 비밀번호를 **request**에서 전달받기
//- 수정할 상품과 비밀번호 일치 여부를 확인한 후, 동일할 때만 글이 **삭제**되게 하기
//- 선택한 상품이 존재하지 않을 경우, “상품 조회에 실패하였습니다." 메시지 반환하기

router.delete('/products/:producstId', async (req, res, next) => {
  try {
    const { password } = req.body;
    const productsId = req.params.producstId;

    const products = await Product.findById(productsId).exec();

    if (!products) {
      return res
        .status(404)
        .json({ errorMessage: '상품 조회에 실패하였습니다.' });
    }

    if (products.password === Number(password)) {
      await Product.deleteOne({ _id: productsId });
      return res.status(200).json({ message: '상품을 삭제하였습니다.' });
    } else {
      return res
        .status(401)
        .json({ message: '상품에 삭제할 권한이 존재하지 않습니다.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '서버 에러 발생' });
  }
});

export default router;
