-- USERS
CREATE TABLE users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(40) NOT NULL,
    name VARCHAR(40) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,

    gender VARCHAR(10) NOT NULL
        CHECK (gender IN ('M', 'F', 'Others')),

    date_of_birth DATE,

    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    profile_picture BYTEA
);


-- ADDRESS
CREATE TABLE address (
    address_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INT NOT NULL,

    full_name VARCHAR(60) NOT NULL,
    phone VARCHAR(15) NOT NULL,

    house_number VARCHAR(20) NOT NULL,
    street VARCHAR(255) NOT NULL,

    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,

    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,

    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- BRANDS
CREATE TABLE brands (
    brand_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    brand_name VARCHAR(255) NOT NULL,
    brand_logo VARCHAR(255),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- CATEGORIES
CREATE TABLE categories (
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(40) NOT NULL,

    parent_category INT,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_category)
        REFERENCES categories(category_id)
        ON DELETE CASCADE
);


-- COLORS
CREATE TABLE colors (
    color_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    color_name VARCHAR(50) NOT NULL,

    hex_code VARCHAR(7) NOT NULL
);


-- PRODUCTS
CREATE TABLE products (
    product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    brand_id INT NOT NULL,
    category_id INT NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    discount_price DECIMAL(10,2),

    stock INT NOT NULL,

    warranty_period INT,

    rating DECIMAL(3,2),

    review_count INT DEFAULT 0,

    status BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (brand_id)
        REFERENCES brands(brand_id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE CASCADE
);


-- PRODUCT IMAGES
CREATE TABLE product_images (
    image_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id INT NOT NULL,

    image_url VARCHAR(255) NOT NULL,

    is_primary BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);


-- PRODUCT DETAILS
CREATE TABLE product_details (
    spec_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id INT NOT NULL,

    display_size VARCHAR(20),
    display_type VARCHAR(50),

    refresh_rate VARCHAR(20),

    processor VARCHAR(255),

    ram VARCHAR(20),

    storage VARCHAR(20),

    rear_camera VARCHAR(255),

    front_camera VARCHAR(255),

    battery VARCHAR(20),

    charging VARCHAR(20),

    operating_system VARCHAR(50),

    network VARCHAR(50),

    sim_type VARCHAR(50),

    weight VARCHAR(20),

    dimensions VARCHAR(50),

    color_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    FOREIGN KEY (color_id)
        REFERENCES colors(color_id)
        ON DELETE CASCADE
);


-- INVENTORY
CREATE TABLE inventory (
    inventory_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id INT NOT NULL,

    quantity_available INT NOT NULL,

    quantity_reserved INT NOT NULL,

    warehouse_location VARCHAR(255) NOT NULL,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);

CREATE TABLE wishlist (
    wishlist_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INT NOT NULL,

    product_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    UNIQUE(user_id, product_id)
);

CREATE TABLE cart (
    cart_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    cart_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    FOREIGN KEY(cart_id)
        REFERENCES cart(cart_id)
        ON DELETE CASCADE,

    FOREIGN KEY(product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);