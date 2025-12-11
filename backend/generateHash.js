const bcrypt = require('bcryptjs');

// Генерация хеша для пароля "password123"
const password = 'password123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nИспользуйте этот хеш в SQL для всех тестовых пользователей:');
    console.log(`'${hash}'`);
});