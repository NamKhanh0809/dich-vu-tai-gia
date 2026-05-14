<template>
  <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-5xl font-bold mb-6">Dịch vụ gia đình chất lượng cao</h1>
      <p class="text-xl mb-8">Kết nối bạn với các thợ lành nghề đáng tin cậy</p>
      <router-link to="/booking" class="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
        Đặt dịch vụ ngay
      </router-link>
    </div>
  </div>
  <div class="container mx-auto px-4 py-12">
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-4xl mb-4">🔧</div>
        <h3 class="text-xl font-bold mb-2">Sửa chữa chuyên nghiệp</h3>
        <p class="text-gray-600">Điện nước, máy lạnh, thiết bị gia dụng</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-4xl mb-4">🧹</div>
        <h3 class="text-xl font-bold mb-2">Vệ sinh tận tâm</h3>
        <p class="text-gray-600">Dọn dẹp, giặt giũ, làm sạch sâu</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-4xl mb-4">🎨</div>
        <h3 class="text-xl font-bold mb-2">Cải tạo không gian</h3>
        <p class="text-gray-600">Sơn, trang trí, lắp đặt nội thất</p>
      </div>
    </div>
  </div>
</template>