
CREATE TABLE `member` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30)  unique NOT NULL ,
  `password` varchar(250) DEFAULT NULL,
  `salt` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`)
)ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

