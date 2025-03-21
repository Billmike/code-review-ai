import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';

interface RepositoryAttributes {
  id: number;
  githubId: string;
  name: string;
  fullName: string;
  ownerId: number;
  isPrivate: boolean;
  isEnabled: boolean;
  defaultReviewStyle: 'standard' | 'strict' | 'collaborative';
  installationId: string | null;
  webhookId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RepositoryCreationAttributes extends Optional<RepositoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Repository extends Model<RepositoryAttributes, RepositoryCreationAttributes> implements RepositoryAttributes {
  public id!: number;
  public githubId!: string;
  public name!: string;
  public fullName!: string;
  public ownerId!: number;
  public isPrivate!: boolean;
  public isEnabled!: boolean;
  public defaultReviewStyle!: 'standard' | 'strict' | 'collaborative';
  public installationId!: string | null;
  public webhookId!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Repository.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    defaultReviewStyle: {
      type: DataTypes.ENUM('standard', 'strict', 'collaborative'),
      allowNull: false,
      defaultValue: 'standard',
    },
    installationId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    webhookId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'repositories',
  }
);

// Establish relationship with User
Repository.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });