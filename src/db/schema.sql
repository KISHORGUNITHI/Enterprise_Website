create TABLE USERS(
    user_id INT auto_increment primary key,
    username varchar(40) not null,
    name varchar(40) not null,
    email varchar(40) not null,
    phone number not null,
    hashed_password varchar(255) not null,
    gender varchar(6) not null check(gender in ("M","F","Others")),
    date_of_birth date ,
    is_verfied boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    profile_picture blob default null
);


create table address(
    address_id int auto_increment primary key,
    user_id int not null ,
    Full_name varchar(60) not null,
    phone number not null,
    house_number varchar(20) not null,
    street varchar(255) not null,
    city varchar(100) not null,
    state varchar(100) not null,
    postal_code varchar(20) not null,
    country varchar(100) not null,
    is_default boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (user_id) references users(user_id) on delete cascade
);



create table products(
    product_id int auto_increment primary key,
    name varchar(255) not null,
    description text,
    brand_id int not null,
    category_id int not null,
    price decimal(10,2) not null,
    discount_price decimal(10,2) default null,
    stock int not null,
    warranty_period int default null,
    rating decimal(3,2) default null,
    review_count int default 0,
    status boolean default true,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (brand_id) references brands(brand_id) on delete cascade,
    foreign key (category_id) references categories(category_id) on delete cascade
);

create table product_images(
    image_id int auto_increment primary key,
    product_id int not null,
    image_url varchar(255) not null,
    is_primary boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (product_id) references products(product_id) on delete cascade
);

//brand_id
//brand_name
//brand_logo
//description

create table brands(
    brand_id int auto_increment primary key,
    brand_name varchar(255) not null,
    brand_logo  varchar(255) default null,
    description text default null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
)

create table categories(
    category_id int primary_key,
    name varchar(40) not null,
    parent_category int default null,
    description text,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (parent_category) references categories(category_id) on delete cascade
)

craete table product_de(
    spec_id int auto_increment primary key,
    product_id int not null,
    display_size varchar(20) default null,
    display_type varchar(50) default null,
    refresh_rate varchar(20) default null,
    processor varchar(255) default null,
    ram varchar(20) default null,
    storage varchar(20) default null,
    rear_camera varchar(255) default null,
    front_camera varchar(255) default null,
    battery varchar(20) default null,
    charging varchar(20) default null,
    operating_system varchar(50) default null,
    network varchar(50) default null,
    sim_type varchar(50) default null,
    weight varchar(20) default null,
    dimensions varchar(50) default null,
    color_id int not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (product_id) references products(product_id) on delete cascade,
    foreign key (color_id) references colors(color_id) on delete cascade    
);

create table colors(
    color_id int auto_increment primary key,
    color_name varchar(50) not null,
    hex_code varchar(7) not null
); 


create table inventory(
    inventory_id int auto_increment primary key,
    product_id int not null,
    quantity_available int not null,
    quantity_reserved int not null,
    warehouse_location varchar(255) not null,
    last_updated timestamp default current_timestamp on update current_timestamp,
    foreign key (product_id) references products(product_id) on delete cascade
)
