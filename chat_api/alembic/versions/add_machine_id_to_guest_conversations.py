"""Add machine_id to guest_conversations

Revision ID: add_machine_id_001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_machine_id_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add machine_id column to guest_conversations table
    op.add_column('guest_conversations', sa.Column('machine_id', sa.String(), nullable=True))
    
    # Create index on machine_id for better query performance
    op.create_index(op.f('ix_guest_conversations_machine_id'), 'guest_conversations', ['machine_id'], unique=False)


def downgrade():
    # Drop index
    op.drop_index(op.f('ix_guest_conversations_machine_id'), table_name='guest_conversations')
    
    # Drop machine_id column
    op.drop_column('guest_conversations', 'machine_id') 