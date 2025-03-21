import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Repository } from './repository';

export interface PullRequestAttributes {
  id: number;
  repositoryId: number;
  prNumber: number;
  title: string;
  authorUsername: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  headSha: string;
  baseSha: string;
  htmlUrl: string;
  diffUrl: string;
  reviewStyle?: 'standard' | 'strict' | 'collaborative';
  reviewStartedAt?: Date;
  reviewCompletedAt?: Date;
  commentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PullRequestCreationAttributes extends Optional<PullRequestAttributes, 'id' | 'reviewStyle' | 'reviewStartedAt' | 'reviewCompletedAt' | 'commentCount' | 'createdAt' | 'updatedAt'> {}

export class PullRequest extends Model<PullRequestAttributes, PullRequestCreationAttributes> implements PullRequestAttributes {
  public id!: number;
  public repositoryId!: number;
  public prNumber!: number;
  public title!: string;
  public authorUsername!: string;
  public status!: 'pending' | 'analyzing' | 'completed' | 'failed';
  public headSha!: string;
  public baseSha!: string;
  public htmlUrl!: string;
  public diffUrl!: string;
  public reviewStyle?: 'standard' | 'strict' | 'collaborative';
  public reviewStartedAt?: Date;
  public reviewCompletedAt?: Date;
  public commentCount?: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

PullRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    repositoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Repository,
        key: 'id',
      },
    },
    prNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorUsername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'analyzing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    headSha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    baseSha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    htmlUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diffUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reviewStyle: {
      type: DataTypes.ENUM('standard', 'strict', 'collaborative'),
      allowNull: true,
    },
    reviewStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    commentCount: {
      type: DataTypes.INTEGER,
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
    tableName: 'pull_requests',
    indexes: [
      {
        unique: true,
        fields: ['repositoryId', 'prNumber'],
      },
    ],
  }
);

PullRequest.belongsTo(Repository, { foreignKey: 'repositoryId', as: 'repository' });