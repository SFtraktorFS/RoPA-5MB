from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./ropas.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_migrations():
    """
    Add any missing columns to existing tables so that deploying new model
    fields onto an already-initialised database does not cause 500 errors.
    """
    inspector = inspect(engine)

    # ------------------------------------------------------------------ #
    # ropa_records                                                         #
    # ------------------------------------------------------------------ #
    if "ropa_records" in inspector.get_table_names():
        existing = {col["name"] for col in inspector.get_columns("ropa_records")}

        # (column_name, SQLite type, optional DEFAULT clause)
        desired_columns = [
            ("data_controller", "VARCHAR", "NULL"),
            ("data_processor", "VARCHAR", "NULL"),
            ("data_sharing", "VARCHAR", "NULL"),
            ("security_measures", "VARCHAR", "NULL"),
            ("data_source", "VARCHAR", "NULL"),
            ("international_transfer", "VARCHAR", "NULL"),
            ("reason", "VARCHAR", "NULL"),
            ("expiration_date", "VARCHAR", "NULL"),
        ]

        with engine.connect() as conn:
            for col_name, col_type, default in desired_columns:
                if col_name not in existing:
                    conn.execute(
                        text(
                            f"ALTER TABLE ropa_records "
                            f"ADD COLUMN {col_name} {col_type} DEFAULT {default}"
                        )
                    )
            conn.commit()

    # ------------------------------------------------------------------ #
    # users                                                                #
    # ------------------------------------------------------------------ #
    if "users" in inspector.get_table_names():
        existing = {col["name"] for col in inspector.get_columns("users")}

        desired_columns = [
            ("is_active", "INTEGER", "1"),
        ]

        with engine.connect() as conn:
            for col_name, col_type, default in desired_columns:
                if col_name not in existing:
                    conn.execute(
                        text(
                            f"ALTER TABLE users "
                            f"ADD COLUMN {col_name} {col_type} DEFAULT {default}"
                        )
                    )
            conn.commit()
