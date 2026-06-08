UPDATE usuarios 
SET senha = '$2a$10$esa/NEEuBHXzTYh.Y/P.v.ERt4Yr.h03VzJgvQzr1EPGrwV5ZqRuW'
WHERE email = 'teste01@gmail.com';

SELECT email, length(senha) as len FROM usuarios WHERE email = 'teste01@gmail.com';
