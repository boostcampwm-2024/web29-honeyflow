import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import { CreateSpaceDto } from './dto/create.space.dto';
import { GUEST_USER_ID } from 'src/common/constants/space.constants';
import { ERROR_MESSAGES } from 'src/common/constants/error.message.constants';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { SpaceService } from './space.service';
@ApiTags('space')
@Controller('space')
export class SpaceController {
  private readonly logger = new Logger(SpaceController.name);
  constructor(private readonly spaceService: SpaceService) {}

  @Version('1')
  @Get('/:id')
  async existsBySpace(@Param('id') id: string) {
    try {
      this.logger.log('Fetching space id', {
        method: 'getSpace',
        id,
      });
      const result = await this.spaceService.existsById(id);
      this.logger.log('Space fetch completed', {
        method: 'getSpaceid',
        id,
        found: !!result,
      });
      return result;
    } catch (error) {
      this.logger.error(ERROR_MESSAGES.SPACE.UPDATE_FAILED, {
        method: 'getSpaceid',
        id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Version('1')
  @Get('/breadcrumb/:id')
  async getBreadcrumb(@Param('id') id: string) {
    const result = await this.spaceService.getBreadcrumb(id);
    return result;
  }

  @Version('2')
  @Post()
  @ApiOperation({ summary: '스페이스 생성' })
  @ApiResponse({ status: 201, description: '스페이스 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async createSpaceV3(@Body() createSpaceDto: CreateSpaceDto) {
    try {
      this.logger.log('Creating new space', {
        method: 'createSpaceV2',
        userId: createSpaceDto.userId,
        spaceName: createSpaceDto.spaceName,
        parentContextNodeId: createSpaceDto.parentContextNodeId,
      });

      const { userId, spaceName, parentContextNodeId } = createSpaceDto;

      if (userId !== GUEST_USER_ID || !spaceName) {
        this.logger.error(ERROR_MESSAGES.SPACE.BAD_REQUEST, {
          method: 'createSubSpaceV3',
          error: ERROR_MESSAGES.SPACE.BAD_REQUEST,
          userId,
          spaceName,
        });
        throw new HttpException(
          ERROR_MESSAGES.SPACE.BAD_REQUEST,
          HttpStatus.BAD_REQUEST,
        );
      }

      const space = await this.spaceService.create(
        userId,
        spaceName,
        parentContextNodeId,
      );

      if (!space) {
        this.logger.error(ERROR_MESSAGES.SPACE.CREATION_FAILED, {
          method: 'createSpaceV3',
          error: ERROR_MESSAGES.SPACE.CREATION_FAILED,
          userId,
          spaceName,
        });
        throw new HttpException(
          ERROR_MESSAGES.SPACE.CREATION_FAILED,
          HttpStatus.NOT_FOUND,
        );
      }

      this.logger.log('Space V3 created successfully', {
        method: 'createSpaceV3',
        userId,
        spaceName,
        result: space.toObject().id,
      });
      return { urlPath: space.toObject().id };
    } catch (error) {
      this.logger.error('Unexpected error in space creation V3', {
        method: 'createSpaceV3',
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Version('1')
  @Put('/:id')
  @ApiOperation({ summary: '스페이스 업데이트' })
  @ApiResponse({ status: 201, description: '스페이스 업데이트 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async updateSpace(@Param('id') id: string) {
    const result = await this.spaceService.existsById(id);
    if (!result) {
      this.logger.error(ERROR_MESSAGES.SPACE.CREATION_FAILED, {
        method: 'createSpaceV3',
        error: ERROR_MESSAGES.SPACE.NOT_FOUND,
      });
      throw new HttpException(
        ERROR_MESSAGES.SPACE.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
